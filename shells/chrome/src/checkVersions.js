// import genUuid from "uuid/v1";
// import { version as devToolsVersion } from "../shells/chrome/manifest.json";

// let uuid = localStorage.getItem("uuid");

// if (!uuid) {
//   uuid = genUuid();
//   localStorage.setItem("uuid", uuid);
// }

// export default function runVersionCheck() {
//   let hasSeenApollo = false;
//   setInterval(() => {
//     evalInPage(`!!window.__APOLLO_CLIENT__`, result => {
//       if (result) {
//         if (!hasSeenApollo) {
//           hasSeenApollo = true;

//           // It just appeared, check versions
//           checkVersions();
//         }
//       } else {
//         if (hasSeenApollo) {
//           // We lost it, perhaps switched pages
//           hasSeenApollo = false;
//         }
//       }
//     });
//   }, 1000);
// }

// function checkVersions() {
//   evalInPage(
//     `
//     (function(){
//       var versions = [];

//       if (window.__APOLLO_CLIENT__) {
//         versions.push({ packageName: 'apollo-client', version: window.__APOLLO_CLIENT__.version });
//       }

//       return versions;
//     })()
//   `,
//     versions => {
//       const graphQLParams = {
//         query: `
//         query CompatibilityMessages(
//           $uuid: String
//           $devToolsVersion: String!
//           $versions: [VersionInput]
//         ) {
//           compatibilityMessages(
//             uuid: $uuid,
//             devToolsVersion: $devToolsVersion,
//             versions: $versions
//           ) {
//             message
//           }
//         }
//       `,
//         variables: {
//           uuid,
//           devToolsVersion,
//           versions,
//         },
//       };

//       return fetch("https://devtools.apollodata.com/graphql", {
//         method: "post",
//         mode: "cors",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(graphQLParams),
//       })
//         .then(function(response) {
//           return response.json();
//         })
//         .then(function(response) {
//           if (!response.data.compatibilityMessages) return;
//           response.data.compatibilityMessages.forEach(cm => {
//             evalInPage(
//               `console.info('Apollo devtools message:', "${cm.message}")`
//             );
//           });
//         });
//     }
//   );
// }
