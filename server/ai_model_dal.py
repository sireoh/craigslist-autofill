import json
from pathlib import Path
from fastapi import HTTPException, status
from helpers import Helpers
from constants import AI_RESULTS_DIR, AI_RESULTS_CONFIG_PATH
from models import AIConfig


def prompt_ai(client):
    # Ensure the results directory exists
    AI_RESULTS_DIR.mkdir(exist_ok=True)

    prompt_data = Helpers.AI.get_prompt_data()

    # Prepare the structured prompt
    structured_prompt = f"""
    {prompt_data.get("prompt.txt", {}).get("content", "")}
    config.json: {prompt_data.get("config.json", {})}
    output_XXXX.json: {prompt_data.get("output.json", {}).get("data", [])}
    """

    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3-0324:novita",
        messages=[{"role": "user", "content": structured_prompt}],
    )

    # Get the completion message object
    message = completion.choices[0].message

    # Check if content exists and is not None
    if not message.content:
        return {"status": "error", "message": "No content in API response"}

    # Get the completion content
    completion_content = message.content

    try:
        # Find the JSON block - handle case where markers don't exist
        json_start = completion_content.find("```json\n")
        if json_start == -1:
            # Try without the 'json' specifier
            json_start = completion_content.find("```\n")
            if json_start == -1:
                return {
                    "status": "error",
                    "message": "No JSON code block found in response",
                }
            json_start += len("```\n")
        else:
            json_start += len("```json\n")

        json_end = completion_content.find("\n```", json_start)
        if json_end == -1:
            return {
                "status": "error",
                "message": "No closing code block found in response",
            }

        json_str = completion_content[json_start:json_end]

        # Parse the JSON string to ensure it's valid
        json_data = json.loads(json_str)

        # Get the next index and create the filename
        current_index = Helpers.increment_index(AI_RESULTS_CONFIG_PATH)
        output_path = AI_RESULTS_DIR / f"result_{current_index:04d}.json"

        # Save the JSON data to file
        with open(output_path, "w") as f:
            json.dump(json_data, f, indent=2)

        return {"status": "success", "file_path": str(output_path)}

    except json.JSONDecodeError as e:
        return {"status": "error", "message": f"Invalid JSON: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}


def update_ai_config(req: AIConfig):
    # Convert the entire AIConfig model to dict
    ai_config = req.model_dump()

    config_path = Path("ai_config.json")

    try:
        # Write the preset data directly to file
        updated_config = config_path.write_text(json.dumps(ai_config, indent=2))
        return {"status": "success", "ai_config": updated_config}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update config: {str(e)}",
        )


def get_ai_config():
    return Helpers.AI.get_ai_config_file()
