with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

old = '''    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mon-projet-react</title>'''

new = '''    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap"
      rel="stylesheet"
    />
    <title>mon-projet-react</title>'''

if old in content:
    content = content.replace(old, new, 1)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("Polices Inter + Montserrat ajoutees.")
else:
    print("ATTENTION: bloc non trouve.")
