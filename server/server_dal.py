import os

from fastapi import HTTPException
from fastapi.responses import FileResponse


def get_outputs():
    folder_path = os.path.join(os.path.dirname(__file__), "outputs")
    try:
        filenames = os.listdir(folder_path)
        return {
            "message": "success",
            "data": [
                f
                for f in filenames
                if os.path.isfile(os.path.join(folder_path, f)) and f != "config.json"
            ],
        }
    except FileNotFoundError:
        print(f"The folder {folder_path} does not exist.")
        return {"message": "fail"}


def delete_output_by_name(filename: str):
    folder_path = os.path.join(os.path.dirname(__file__), "outputs")
    file_path = os.path.join(folder_path, filename)

    if os.path.exists(file_path) and os.path.isfile(file_path):
        try:
            os.remove(file_path)
            return {"message": "success"}
        except Exception as e:
            print(f"Error deleting file: {e}")
            return {"message": "fail", "error": str(e)}
    else:
        return {"message": "fail", "error": "file not found"}


def serve_output_file(filename: str):
    folder_path = os.path.join(os.path.dirname(__file__), "outputs")
    file_path = os.path.join(folder_path, filename)

    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream",  # or guess based on extension
    )
