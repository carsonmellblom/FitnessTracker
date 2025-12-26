"""
Photo Processing Microservice
Consumes messages from RabbitMQ and processes photos
"""
import json
import time
import psycopg2
import pika
from pika.exceptions import AMQPConnectionError

from config import (
    RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASSWORD, RABBITMQ_QUEUE,
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
)
from processor import process_photo


def get_db_connection():
    """Create a PostgreSQL database connection."""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


def update_photo_status(photo_id: int, status: str, result: dict = None):
    """Update the photo processing status in the database."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if status == 'Completed' and result:
                # Update with results
                cur.execute('''
                    UPDATE "ProgressPhotos"
                    SET "ProcessingStatus" = %s,
                        "ThumbnailPath" = %s,
                        "BodyAnalysisJson" = %s,
                        "ProcessedAt" = NOW()
                    WHERE "Id" = %s
                ''', (
                    2,  # Completed enum value
                    result.get('thumbnail_path'),
                    json.dumps(result.get('body_analysis')),
                    photo_id
                ))
            elif status == 'Failed':
                # Update with error
                cur.execute('''
                    UPDATE "ProgressPhotos"
                    SET "ProcessingStatus" = %s,
                        "ProcessingError" = %s,
                        "ProcessedAt" = NOW()
                    WHERE "Id" = %s
                ''', (
                    3,  # Failed enum value
                    result.get('error') if result else 'Unknown error',
                    photo_id
                ))
            elif status == 'Processing':
                cur.execute('''
                    UPDATE "ProgressPhotos"
                    SET "ProcessingStatus" = %s
                    WHERE "Id" = %s
                ''', (1, photo_id))  # Processing enum value
            
            conn.commit()
            print(f"Updated photo {photo_id} status to {status}")
    finally:
        conn.close()


def process_message(ch, method, properties, body):
    """Process incoming RabbitMQ message."""
    try:
        message = json.loads(body)
        photo_id = message['PhotoId']
        image_path = message['ImagePath']
        
        print(f"Processing photo {photo_id}: {image_path}")
        
        # Update status to Processing
        update_photo_status(photo_id, 'Processing')
        
        # Process the photo
        result = process_photo(image_path, photo_id)
        
        if result['success']:
            update_photo_status(photo_id, 'Completed', result)
            print(f"Successfully processed photo {photo_id}")
        else:
            update_photo_status(photo_id, 'Failed', result)
            print(f"Failed to process photo {photo_id}: {result['error']}")
        
        # Acknowledge the message
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except json.JSONDecodeError as e:
        print(f"Invalid message format: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def connect_to_rabbitmq():
    """Establish connection to RabbitMQ with retry logic."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300
    )
    
    max_retries = 10
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            connection = pika.BlockingConnection(parameters)
            print(f"Connected to RabbitMQ at {RABBITMQ_HOST}:{RABBITMQ_PORT}")
            return connection
        except AMQPConnectionError as e:
            print(f"Connection attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise


def main():
    """Main entry point for the photo processing service."""
    print("Starting Photo Processing Service...", flush=True)
    print(f"RabbitMQ: {RABBITMQ_HOST}:{RABBITMQ_PORT}", flush=True)
    print(f"PostgreSQL: {DB_HOST}:{DB_PORT}/{DB_NAME}", flush=True)
    
    connection = connect_to_rabbitmq()
    channel = connection.channel()
    
    # Declare the queue (in case it doesn't exist)
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
    
    # Set prefetch count (process one message at a time)
    channel.basic_qos(prefetch_count=1)
    
    # Start consuming
    channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=process_message)
    
    print(f"Listening for messages on queue: {RABBITMQ_QUEUE}")
    print("Press CTRL+C to exit")
    
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Shutting down...")
        channel.stop_consuming()
    finally:
        connection.close()


if __name__ == '__main__':
    main()
