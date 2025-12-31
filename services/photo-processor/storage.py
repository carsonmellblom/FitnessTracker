"""
File storage abstraction for photo processor
Automatically uses Azure Blob Storage if connection string is present, otherwise local storage
"""
import os  
from abc import ABC, abstractmethod
from azure.storage.blob import BlobServiceClient, ContentSettings


class FileStorage(ABC):
    """Abstract base class for file storage"""
    
    @abstractmethod
    def download_file(self, filename: str, destination: str) -> bool:
        """Download a file from storage to local path"""
        pass
    
    @abstractmethod
    def upload_file(self, source: str, filename: str, content_type: str = "image/jpeg") -> bool:
        """Upload a file from local path to storage"""
        pass


class LocalStorage(FileStorage):
    """Local file system storage for development"""
    
    def __init__(self, upload_path: str = "./uploads"):
        self.upload_path = upload_path
        os.makedirs(self.upload_path, exist_ok=True)
        print(f"Using local file storage at: {self.upload_path}")
    
    def download_file(self, filename: str, destination: str) -> bool:
        """Copy file from uploads directory to destination"""
        source = os.path.join(self.upload_path, filename)
        
        if not os.path.exists(source):
            print(f"Warning: File not found in local storage: {source}")
            return False
        
        # If source and destination are the same, no need to copy
        if os.path.abspath(source) == os.path.abspath(destination):
            print(f"Source and destination are the same: {filename}")
            return True
            
        import shutil
        shutil.copy2(source, destination)
        print(f"Downloaded {filename} from local storage")
        return True
    
    def upload_file(self, source: str, filename: str, content_type: str = "image/jpeg") -> bool:
        """Copy file from source to uploads directory"""
        destination = os.path.join(self.upload_path, filename)
        
        if not os.path.exists(source):
            print(f"Error: Source file not found: {source}")
            return False
        
        # If source and destination are the same, no need to copy
        if os.path.abspath(source) == os.path.abspath(destination):
            print(f"File already in correct location: {filename}")
            return True
            
        import shutil
        shutil.copy2(source, destination)
        print(f"Uploaded {filename} to local storage")
        return True


class BlobStorage(FileStorage):
    """Azure Blob Storage for production"""
    
    def __init__(self, connection_string: str, container_name: str = "progress-photos"):
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = container_name
        self.container_client = self.blob_service_client.get_blob_container_client(container_name)
        
        # Create container if it doesn't exist
        if not self.container_client.exists():
            self.container_client.create_container()
            print(f"Created blob container: {container_name}")
        
        print(f"Using Azure Blob Storage: Container '{container_name}'")
    
    def download_file(self, filename: str, destination: str) -> bool:
        """Download file from blob storage to local path"""
        try:
            blob_client = self.container_client.get_blob_client(filename)
            
            with open(destination, "wb") as file:
                download_stream = blob_client.download_blob()
                file.write(download_stream.readall())
            
            print(f"Downloaded {filename} from blob storage")
            return True
        except Exception as e:
            print(f"Error downloading {filename} from blob storage: {e}")
            return False
    
    def upload_file(self, source: str, filename: str, content_type: str = "image/jpeg") -> bool:
        """Upload file from local path to blob storage"""
        try:
            blob_client = self.container_client.get_blob_client(filename)
            
            with open(source, "rb") as data:
                content_settings = ContentSettings(content_type=content_type)
                blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
            
            print(f"Uploaded {filename} to blob storage")
            return True
        except Exception as e:
            print(f"Error uploading {filename} to blob storage: {e}")
            return False


def create_storage(connection_string: str = None, container_name: str = "progress-photos") -> FileStorage:
    """
    Factory function to create appropriate storage implementation
    
    Args:
        connection_string: Azure Storage connection string (optional)
        container_name: Blob container name (default: 'progress-photos')
    
    Returns:
        BlobStorage if connection_string provided, otherwise LocalStorage
    """
    if connection_string:
        return BlobStorage(connection_string, container_name)
    else:
        return LocalStorage()
