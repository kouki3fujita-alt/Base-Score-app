import logging
import os
from datetime import datetime

# Secure logging configuration
# Ensure logs are stored in a file, not just printed to stdout
LOG_FILE = 'agent_audit.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

def log_action(action, details=None):
    """
    Logs an agent action for auditing purposes.
    """
    user = os.getenv('USER', 'unknown_agent')
    msg = f"Agent: {user} | Action: {action}"
    if details:
        msg += f" | Details: {details}"
    logging.info(msg)

def log_security_event(event_type, description):
    """
    Logs security-related events (e.g., token refresh, scope verification).
    """
    logging.warning(f"SECURITY_EVENT: {event_type} | {description}")
