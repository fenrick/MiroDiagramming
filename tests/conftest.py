import os

# Provide required secrets for configuration during tests.
os.environ["MIRO_CLIENT_ID"] = "test-client-id"
os.environ["MIRO_CLIENT_SECRET"] = "test-client-secret"
os.environ["MIRO_WEBHOOK_SECRET"] = "test-webhook-secret"
os.environ["MIRO_OAUTH_REDIRECT_URI"] = "http://redirect"
