function escape(key) {
  const escapeRegex = /[=:]/g;
  const escaperLookup = {
    "=": "=0",
    ":": "=2"
  };
  const escapedString = key.replace(escapeRegex, (match) => escaperLookup[match]);
  console.log(`$${escapedString}`);
  return `$${escapedString}`;
}

escape("=:2");
