// function deepHasOnlyProperties(obj, allowedProperties) {
//   for (const key in obj) {
//     if (!allowedProperties.includes(key)) {
//       return false;
//     }
//     if (
//       typeof obj[key] === "object" &&
//       !deepHasOnlyProperties(obj[key], allowedProperties)
//     ) {
//       return false;
//     }
//   }
//   return true;
// }

// const obj1 = {
//   person: {
//     name: "Alice",
//     age: 30,
//   },
//   location: {
//     city: "New York",
//     country: "USA",
//   },
// };

// const obj2 = {
//   person: {
//     name: "Bob",
//     gender: "male",
//   },
//   location: {
//     city: "Los Angeles",
//   },
// };

// const allowedProperties = ["name", "age", "city"];

// console.log(deepHasOnlyProperties(obj1, allowedProperties)); // Output: true
// console.log(deepHasOnlyProperties(obj2, allowedProperties)); // Output: false
