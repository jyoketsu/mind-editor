```
 _____ ______   ___  ________   ________
|\   _ \  _   \|\  \|\   ___  \|\   ___ \
\ \  \\\__\ \  \ \  \ \  \\ \  \ \  \_|\ \
 \ \  \\|__| \  \ \  \ \  \\ \  \ \  \ \\ \
  \ \  \    \ \  \ \  \ \  \\ \  \ \  \_\\ \
   \ \__\    \ \__\ \__\ \__\\ \__\ \_______\
    \|__|     \|__|\|__|\|__| \|__|\|_______|

```

## Introduction

Mind Editor. Developed using `Vite + React + TypeScript + React-Router + Redux-Toolkit + Material-UI + react-i18next`. Supports multiple languages and dark mode.

## Technologies Used

- [Vite](https://www.vitejs.net/) - Build Tool
- [React](https://reactjs.org/) - Framework
- [React Router](https://reactrouter.com/docs/en/v6) - Routing
- [React Redux](https://react-redux.js.org/) - State Management
- [Redux Toolkit](https://redux-toolkit.js.org/) - Redux Logic Utilities
- [Material UI](https://mui.com/) - UI Library
- [react-i18next](https://react.i18next.com) - Multilingual Support

## [Online Demo](https://jyoketsu.github.io/mind-editor/)

## Installation

To install the necessary dependencies, run the following command:

```
yarn
```

## Start Development Server

To start the development server, use the following command:

```
yarn dev
```

## Build and Deploy

To compile and publish the application, execute the following command:

```
yarn deploy
```

## Usage

```javascript
/**
 * Get the URL of a third-party application
 * @param nodeKey
 * @returns
 */
export const getThirdAppUrl = (
  nodeKey: string,
  cardKey: string,
  nodeType: Type,
  appUrl: string,
  editMode?: boolean
) => {
  const getDataApi = JSON.stringify({
    url: `${API_URL}/appendix/detail`,
    params: { nodeKey, cardKey, nodeType },
    docDataName: "content",
  });
  const patchDataApi = JSON.stringify({
    url: `${API_URL}/appendix/node`,
    params: { nodeKey, type: "doc" },
    docDataName: nodeType === "draw" ? ["content", "name"] : "content",
  });
  const getUptokenApi = JSON.stringify({
    url: "https://baokudata.qingtime.cn/sgbh/upTokenQiniu/getQiNiuUpToken",
    params: { token: "", type: 2 },
  });
  const token = localStorage.getItem("auth_token");
  // isEdit 2:edit mode 1:read-only mode 0:preview mode
  const query = `token=${token}&getDataApi=${encodeURIComponent(
    getDataApi
  )}&patchDataApi=${encodeURIComponent(
    patchDataApi
  )}&getUptokenApi=${encodeURIComponent(getUptokenApi)}&isEdit=${
    editMode ? 2 : 0
  }&hideHead=1`;
  return `${appUrl}?${query}`;
};
```

## [Sample address](http://localhost:3000/?token=E9POCJMZ5SH4IDRXK2MJBSQNIA2IEWO791HZIBS8TCNT3C7P&getDataApi=%7B%22url%22%3A%22https%3A%2F%2Fnotesfoxx.qingtime.cn%2Fappendix%2Fdetail%22%2C%22params%22%3A%7B%22nodeKey%22%3A%225B1EC086%22%2C%22cardKey%22%3A%221423264751%22%2C%22nodeType%22%3A%22mind%22%7D%2C%22docDataName%22%3A%22content%22%7D&patchDataApi=%7B%22url%22%3A%22https%3A%2F%2Fnotesfoxx.qingtime.cn%2Fappendix%2Fnode%22%2C%22params%22%3A%7B%22nodeKey%22%3A%225B1EC086%22%2C%22type%22%3A%22doc%22%7D%2C%22docDataName%22%3A%22content%22%7D&getUptokenApi=%7B%22url%22%3A%22https%3A%2F%2Fbaokudata.qingtime.cn%2Fsgbh%2FupTokenQiniu%2FgetQiNiuUpToken%22%2C%22params%22%3A%7B%22token%22%3A%22%22%2C%22type%22%3A2%7D%7D&isEdit=2&hideHead=1)
