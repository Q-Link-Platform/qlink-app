import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

path_62 = r"C:\Users\bhave\.gemini\antigravity-ide\brain\62d46c5a-8340-4d52-859f-7d65247ce195\.system_generated\logs\transcript.jsonl"
path_14 = r"C:\Users\bhave\.gemini\antigravity-ide\brain\144f06be-cd44-4de1-aab1-84f320d7e46e\.system_generated\logs\transcript.jsonl"

def summarize_session(path, start_step=0, end_step=1000):
    current_req = None
    responses = []
    edits = []
    commands = []
    
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                idx = data.get('step_index')
                if idx < start_step or idx > end_step:
                    continue
                
                stype = data.get('type')
                
                if stype == 'USER_INPUT':
                    content = data.get('content', '')
                    if '<USER_REQUEST>' in content:
                        req = content.split('<USER_REQUEST>')[1].split('</USER_REQUEST>')[0].strip()
                        if req and req != current_req:
                            if current_req:
                                print(f"\n==========================================")
                                print(f"USER REQUEST: {current_req}")
                                print(f"MODIFIED FILES / EDITS: {list(set(edits))}")
                                print(f"COMMANDS RUN: {list(set(commands))}")
                                print(f"SUMMARY OF ASSISTANT RESPONSES:")
                                for r in responses[:3]:
                                    clean_r = r.replace('\n', ' ')
                                    print(f" - {clean_r[:250]}...")
                            current_req = req
                            responses = []
                            edits = []
                            commands = []
                
                if data.get('source') == 'MODEL' or 'PLANNER' in stype:
                    txt = data.get('content', '')
                    if txt and len(txt.strip()) > 10:
                        responses.append(txt.strip())
                
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    name = tc.get('name') or tc.get('toolName')
                    args = tc.get('args', {})
                    if name in ['replace_file_content', 'write_to_file', 'multi_replace_file_content']:
                        tf = args.get('TargetFile') or args.get('targetFile')
                        if tf: edits.append(tf)
                    elif name == 'run_command':
                        cmd = args.get('CommandLine') or args.get('commandLine')
                        if cmd: commands.append(cmd)

            except Exception as e:
                pass
                
    if current_req:
        print(f"\n==========================================")
        print(f"USER REQUEST: {current_req}")
        print(f"MODIFIED FILES / EDITS: {list(set(edits))}")
        print(f"COMMANDS RUN: {list(set(commands))}")
        print(f"SUMMARY OF ASSISTANT RESPONSES:")
        for r in responses[:3]:
            clean_r = r.replace('\n', ' ')
            print(f" - {clean_r[:250]}...")

print("=== SESSION 62d46c5a (Steps 515 to 830) ===")
summarize_session(path_62, 515, 830)

print("\n\n=== SESSION 144f06be (Steps 0 to 10) ===")
summarize_session(path_14, 0, 10)
