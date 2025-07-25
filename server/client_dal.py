import json
from pathlib import Path
from fastapi import status, HTTPException
from models import PresetData


def update_config(req: PresetData):
    # Convert the entire PresetData model to dict
    preset_data = req.model_dump()

    config_path = Path("config.json")

    try:
        # Write the preset data directly to file
        updated_config = config_path.write_text(json.dumps(preset_data, indent=2))
        return {"status": "success", "config": updated_config}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update config: {str(e)}",
        )


def load_output_file(req: PresetData, output_file: str):
    # Convert the entire PresetData model to dict
    preset_data = req.model_dump()

    # Add or update the output_file in the preset_data
    preset_data["output_file"] = output_file

    config_path = Path("config.json")

    try:
        # Write the preset data directly to file
        updated_config = config_path.write_text(json.dumps(preset_data, indent=2))
        return {"status": "success", "config": updated_config}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update config: {str(e)}",
        )
