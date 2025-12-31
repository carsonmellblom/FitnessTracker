"""
Photo Processing Service Configuration
"""
import os

# RabbitMQ Configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'host.docker.internal')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_QUEUE = 'photo-processing'

# PostgreSQL Configuration
DB_HOST = os.getenv('DB_HOST', 'host.docker.internal')
DB_PORT = int(os.getenv('DB_PORT', 5432))
DB_NAME = os.getenv('DB_NAME', 'fitness_tracker')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# Photo Processing Configuration
THUMBNAIL_SIZE = (300, 300)
UPLOADS_PATH = os.getenv('UPLOADS_PATH', '/app/uploads')

# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING', '')
AZURE_STORAGE_CONTAINER_NAME = os.getenv('AZURE_STORAGE_CONTAINER_NAME', 'progress-photos')
USE_BLOB_STORAGE = bool(AZURE_STORAGE_CONNECTION_STRING)
