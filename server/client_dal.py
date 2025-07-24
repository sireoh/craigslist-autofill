import json
from pathlib import Path
from fastapi import status, HTTPException
from models import PresetData


def update_config(req: PresetData):
    # Convert Pydantic model to dict using model_dump()
    preset_data = req.model_dump()

    config_path = Path("config.json")

    try:
        # Load existing config if it exists
        current_config = {}
        if config_path.exists():
            current_config = json.loads(config_path.read_text())

        # Update presets in the config
        if "presets" not in current_config:
            current_config["presets"] = {}

        # Store the preset data under its ID
        current_config["presets"][preset_data["id"]] = preset_data["settings"]

        # Write back to file
        config_path.write_text(json.dumps(current_config, indent=2))

        return {"status": "success", "config": current_config}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update config: {str(e)}",
        )
