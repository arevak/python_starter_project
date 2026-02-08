"""
Application Configuration Module
=================================
This module centralizes all application settings in one place using Pydantic's
BaseSettings class. Instead of scattering environment variable reads throughout
the codebase, every configurable value lives here.

How it works:
  1. Pydantic BaseSettings reads values from environment variables automatically.
  2. Variable names are matched case-insensitively (e.g., the env var APP_NAME
     maps to the Python field `app_name`).
  3. If an environment variable isn't set, the default value defined here is used.
  4. The `model_config` dict tells Pydantic to also load variables from a `.env`
     file, so you don't have to export them in your shell.

Why use this pattern?
  - Single source of truth for all configuration.
  - Type safety: Pydantic validates that values match their declared types.
  - Easy testing: you can override settings by passing keyword arguments.
  - Framework-agnostic: this module has no dependency on FastAPI itself.
"""

# BaseSettings is a special Pydantic class that reads values from environment
# variables. Regular Pydantic BaseModel only validates data you pass in directly;
# BaseSettings also checks the OS environment and .env files.
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application-wide settings, loaded from environment variables and/or a .env file.

    Attributes:
        app_name:     The display name of the application, used in FastAPI's
                      auto-generated docs page (Swagger UI at /docs).
                      Default: "My App".
        debug:        Enables debug mode. When True, frameworks typically show
                      more verbose error pages. Default: False.
        cors_origins: A list of URLs that are allowed to make cross-origin
                      requests to this backend. In development, the React
                      frontend runs on port 5173, so we allow that origin
                      by default.
                      Learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    """

    app_name: str = "My App"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173"]

    # model_config is a Pydantic v2 configuration dictionary.
    # - "env_file": path to the .env file Pydantic should read.
    #   This is relative to where the server process starts (the backend/ dir),
    #   so ".env" means backend/.env. The project's .env file lives in the
    #   project root, so the TUTORIAL instructs you to change this to "../.env".
    # - "env_file_encoding": ensures the file is read as UTF-8 text.
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


# Create a single global instance of Settings. This is imported by other modules
# (e.g., main.py) so the configuration is loaded once and reused everywhere.
# This pattern is sometimes called a "module-level singleton."
settings = Settings()
