"""Utility functions for encrypting and decrypting secrets."""

from __future__ import annotations

from typing import cast

from cryptography.fernet import Fernet, MultiFernet

from ..core.config import settings

_fernet: Fernet | MultiFernet | None = None
if settings.encryption_key:
    # Support comma-separated keys for rotation: "new,old"
    keys = [k.strip() for k in settings.encryption_key.split(",") if k.strip()]
    if len(keys) == 1:
        _fernet = Fernet(keys[0])
    else:
        _fernet = MultiFernet([Fernet(k) for k in keys])


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
