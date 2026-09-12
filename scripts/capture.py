import sys
import os
import json
import re
import subprocess
from datetime import datetime

def get_git_author():
    try:
        author = subprocess.check_output(["git", "config", "user.name"], text=True).strip()
        if author:
            return author
    except Exception:
        pass
    return "candidate"

def extract_clean_prompt(content):
    if not content:
        return ""
    user_req_match = re.search(r'<USER_REQUEST>(.*?)</USER_REQUEST>', content, re.DOTALL)
    if user_req_match:
        return user_req_match.group(1).strip()
    
    cleaned = re.sub(r'<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>', '', content, flags=re.DOTALL)
    cleaned = re.sub(r'<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<SYSTEM_MESSAGE>.*?</SYSTEM_MESSAGE>', '', cleaned, flags=re.DOTALL)
    return cleaned.strip()

def format_session_log(conversation_id, transcript_path, workspace_root, model_name="gemini-3.7-flash"):
    dir_name = os.path.dirname(transcript_path)
    full_path = os.path.join(dir_name, "transcript_full.jsonl")
    if os.path.exists(full_path):
        transcript_path = full_path
    elif not os.path.exists(transcript_path):
        return None

    turns = []
    current_prompt = None
    current_prompt_time = None
    current_response = ""
    current_response_time = None
    current_model = model_name

    first_prompt_time = None
    last_prompt_time = None
    session_date = None

    with open(transcript_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                step = json.loads(line)
            except Exception:
                continue

            step_type = step.get("type", "")
            source = step.get("source", "")
            created_at = step.get("created_at", "")
            content = step.get("content", "")

            if step_type == "USER_INPUT" or source == "USER_EXPLICIT":
                if current_prompt is not None:
                    turns.append({
                        "prompt": current_prompt,
                        "prompt_time": current_prompt_time,
                        "response": current_response.strip(),
                        "response_time": current_response_time or current_prompt_time,
                        "model": current_model
                    })
                    current_response = ""
                    current_response_time = None

                prompt_text = extract_clean_prompt(content)
                current_prompt = prompt_text
                current_prompt_time = created_at
                if not first_prompt_time and created_at:
                    first_prompt_time = created_at
                if created_at:
                    last_prompt_time = created_at
                    if not session_date:
                        session_date = created_at.split("T")[0]

            elif step_type == "PLANNER_RESPONSE":
                if content and isinstance(content, str) and content.strip():
                    current_response = content
                    current_response_time = created_at

    if current_prompt is not None:
        turns.append({
            "prompt": current_prompt,
            "prompt_time": current_prompt_time,
            "response": current_response.strip(),
            "response_time": current_response_time or current_prompt_time,
            "model": current_model
        })

    if not turns:
        return None

    if not session_date:
        session_date = datetime.utcnow().strftime("%Y-%m-%d")
    if not first_prompt_time:
        first_prompt_time = f"{session_date}T00:00:00.000Z"
    if not last_prompt_time:
        last_prompt_time = first_prompt_time

    try:
        dt = datetime.fromisoformat(first_prompt_time.replace("Z", "+00:00"))
        time_str = dt.strftime("%Y-%m-%d_%H-%M-%S")
    except Exception:
        time_str = f"{session_date}_00-00-00"

    project_name = os.path.basename(os.path.abspath(workspace_root)) or "assignment"
    author_name = get_git_author()

    short_session_id = conversation_id[:8] if len(conversation_id) >= 8 else conversation_id
    filename = f"{time_str}_{conversation_id}.md"
    logs_dir = os.path.join(workspace_root, ".agent-logs")
    os.makedirs(logs_dir, exist_ok=True)
    file_path = os.path.join(logs_dir, filename)

    header = f"""---
session_id: {conversation_id}
date: {session_date}
author: {author_name}
model: {model_name}
tool: antigravity
project: {project_name}
total_exchanges: {len(turns)}
first_prompt_time: {first_prompt_time}
last_prompt_time: {last_prompt_time}
---

# Session Log - {session_date}

Session: `{short_session_id}` | Project: `{project_name}` | Author: `{author_name}`

---
"""

    entries = []
    for idx, turn in enumerate(turns, 1):
        p_time = turn["prompt_time"] or first_prompt_time
        r_time = turn["response_time"] or p_time
        m_name = turn["model"] or model_name
        p_text = turn["prompt"]
        r_text = turn["response"]

        entry = f"""[LOG_ENTRY type=PROMPT num={idx} session={short_session_id}]
timestamp: {p_time}
model: {m_name}

{p_text}


[LOG_ENTRY type=RESPONSE num={idx} session={short_session_id}]
timestamp: {r_time}
model: {m_name}

{r_text}
"""
        entries.append(entry)

    content = header + "\n" + "\n\n".join(entries).strip() + "\n"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return file_path

def main():
    try:
        input_data = sys.stdin.read()
        if input_data:
            payload = json.loads(input_data)
        else:
            payload = {}
    except Exception:
        payload = {}

    conversation_id = payload.get("conversationId", "")
    transcript_path = payload.get("transcriptPath", "")
    workspace_paths = payload.get("workspacePaths", [])
    model_name = payload.get("modelName", "gemini-3.7-flash")

    workspace_root = workspace_paths[0] if workspace_paths else os.getcwd()

    if not transcript_path or not os.path.exists(transcript_path):
        app_data = os.path.expanduser(r"~\.gemini\antigravity-ide")
        if conversation_id:
            transcript_path = os.path.join(app_data, "brain", conversation_id, ".system_generated", "logs", "transcript_full.jsonl")
            if not os.path.exists(transcript_path):
                transcript_path = os.path.join(app_data, "brain", conversation_id, ".system_generated", "logs", "transcript.jsonl")
        else:
            brain_dir = os.path.join(app_data, "brain")
            if os.path.exists(brain_dir):
                subdirs = [os.path.join(brain_dir, d) for d in os.listdir(brain_dir) if os.path.isdir(os.path.join(brain_dir, d))]
                if subdirs:
                    subdirs.sort(key=lambda d: os.path.getmtime(d), reverse=True)
                    conversation_id = os.path.basename(subdirs[0])
                    transcript_path = os.path.join(subdirs[0], ".system_generated", "logs", "transcript_full.jsonl")

    if conversation_id and transcript_path and os.path.exists(transcript_path):
        format_session_log(conversation_id, transcript_path, workspace_root, model_name)

    print(json.dumps({"decision": "allow", "injectSteps": []}))

if __name__ == "__main__":
    main()
