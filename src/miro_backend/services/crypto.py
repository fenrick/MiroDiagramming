"""Utility functions for encrypting and decrypting secrets."""

from __future__ import annotations

from typing import cast

from cryptography.fernet import Fernet

from ..core.config import settings

_fernet: Fernet | None = None
if settings.encryption_key:
    _fernet = Fernet(settings.encryption_key)


def encrypt(text: str) -> str:
    """Encrypt ``text`` using the configured key.

    When no encryption key is configured, the input is returned unchanged.
    """

    if _fernet is None:
        return text
    result = _fernet.encrypt(text.encode())
    return cast(bytes, result).decode()


def decrypt(token: str) -> str:
    """Decrypt ``token`` using the configured key.

    When no encryption key is configured, the token is returned unchanged.
    """

    if _fernet is None:
        return token
    result = _fernet.decrypt(token.encode())
    return cast(bytes, result).decode()
