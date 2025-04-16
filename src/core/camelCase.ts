export function camelCase(words: string) {
  const upperCamelCase = words.replace(/(?:^|[\s-_])(\w)/g, (_, char) =>
    char.toUpperCase(),
  );
  // Lowercase the first letter
  return upperCamelCase.replace(/^[A-Z]/, (char) => char.toLowerCase());
}
