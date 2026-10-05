import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Replace Unsupported types
content = content.replace('Unsupported("uuid")', 'String')
content = content.replace('Unsupported("json")', 'String')

# Remove @@ignore lines and the comment blocks above them
content = re.sub(r'/// The underlying table does not contain a valid unique identifier.*\n', '', content)
content = re.sub(r'@@ignore\n', '', content)
content = content.replace('@ignore', '')

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
