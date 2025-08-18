from importlib import reload

from cryptography.fernet import Fernet

from miro_backend.core import config
from miro_backend.services import crypto as crypto_module


def test_multi_fernet_key_rotation() -> None:
    new_key = Fernet.generate_key().decode()
    old_key = Fernet.generate_key().decode()
    config.settings.encryption_key = f"{new_key},{old_key}"
    reload(crypto_module)
    try:
        old_cipher = Fernet(old_key)
        token = old_cipher.encrypt(b"secret").decode()
        assert crypto_module.decrypt(token) == "secret"
        encrypted = crypto_module.encrypt("another")
        assert Fernet(new_key).decrypt(encrypted.encode()).decode() == "another"
    finally:
        config.settings.encryption_key = None
        reload(crypto_module)
