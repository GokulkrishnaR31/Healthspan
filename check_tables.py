import os

pages_dir = r"g:\rproject\frontend\src\pages"
for file in os.listdir(pages_dir):
    if file.endswith(".jsx"):
        print("=== " + file + " ===")
        path = os.path.join(pages_dir, file)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            print(f"Length: {len(content)} chars")
            lines = content.splitlines()
            print(f"Lines: {len(lines)}")
            # check for table tag
            table_count = content.count("<table")
            print(f"Table count: {table_count}")
            # print snippets of tables
            if "<table" in content:
                print("Contains <table>")
