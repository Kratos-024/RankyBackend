const newDate = new Date();
const today = `${newDate.getFullYear()}-${
  newDate.getMonth() < 10 ? `0${newDate.getMonth()}` : newDate.getMonth()
}-${newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate()}`;

console.log(today);
