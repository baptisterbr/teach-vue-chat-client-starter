function formatDate(input, timeStyle) {
  if (input) {
    let date = new Date(input);

    return new Intl.DateTimeFormat("fr-FR", { timeStyle: timeStyle }).format(
      date
    );
  }
  return input;
}

export default formatDate;
