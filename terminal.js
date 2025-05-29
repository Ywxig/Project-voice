// проверка на наличие localStorage
if (!localStorage.getItem("system")) {
  ERRORS = {
    server_errors: {
      // ошибки серверов. Ото ошибки в работе сервера, они мешают одекватной работе серваера и вызываются соблюдая условия
      "bad connection": {
        "name": "bad connection",
        "description": "Bad network connection",
        "code": "1001",
        "conditions": {
          "network": "50" // состояние сети должно быть ниже 50%
        }
      },

      "overload": {
        "name": "overload",
        "description": "Server overload",
        "code": "1002",
        "conditions": {
          "state": "50", // состояние процессора должно быть ниже 50%
        }
      },

    }
  }
  SYSTEM = {
    name: "Terminal",
    version: "1.0.0",
    vars : {"__user__": {
        "content": "user",
        "type": "string"
      },
      "__path__": {
        "content": "root",
        "type": "string"
      },
      "__server__": {
        "content": "",
        "type": "string"
      }
    },
    programs: {
      "terminal": {
        "name": "Terminal",
        "page": "terminal",
      },
      "desktop": {
        "name": "Desktop",
        "page": "desktop",
      }
    }, // программы, которые можно запустить
    explorer: {
      "root": {
        "documents": {
          "file1.txt": {
            "content": "Это содержимое файла 1.",
            "type": "text"
          },
        },
        "programs": {
          "terminal.exe": {
            "content": "open terminal",
            "type": "program"
          },
          "desktop.exe": {
            "content": "open desktop",
            "type": "program"
          }
        },
        "downloads" : {},
        "notes": {
          "readme.txt": {
            "content": "Hello! Now you see many catalogs and files. You can use commands like 'read', 'write', 'new' to interact with them.\n For example, to read a file, type 'read documents/file1.txt'. To write to a file, type 'write documents/file1.txt New content'. To create a new file, type 'new documents/newfile.txt'.\n\nHave fun exploring!",
            "type": "text"
          },
        },
        "mail": {}
      }
    },

    servers : {
      "localhost:8080": {
        "name": "Localhost",
        "ip": "0.0.0.0",
        "port": "8080",
        "errors" : [], // ошибки сервера 
        "systems" : {
          "state": "100", // состояние системы
          "io": "0", // состояние ввода-вывода
          "ram": "100", // состояние оперативной памяти
          "cpu": "100", // состояние процессора
          "network": "100" // состояние сети
        },
        "master": {
          "documents": {
            "file1.txt": {
              "content": "Это содержимое файла 1 на сервере.",
              "type": "text"
            },
            "program.txt": {
              "content": "echo Hello, World!\nls",
              "type": "text"
            }
          }
        }  
      }
    }
  }
  // если нет, то создаем его
  localStorage.setItem("system", JSON.stringify(SYSTEM));
} else {
  // если есть, то загружаем его
  SYSTEM = JSON.parse(localStorage.getItem("system"));
}

const cmd_descriptions = {
  int: {
    about: `define integer variable. In  global space, you can use it like this: int 'var_name' 'value'.`,
  }, 
  str: {
    about: `define string variable. In global space, you can use it like this: str 'var_name' 'value'.`,
  },
  printf: {
    about: `print variable content on screen, you can use it like this: printf 'var_name'.`,
  },
  echo: {
    about: `print text to terminal. you can use it like this: echo 'text'.`,
  },
  read: {
    about: `read file content, you can use it like this: read 'file_path'.`,
  },
  write: {
    about: `write content to file. you can use it like this: write 'file_path' [-a|-w] <content>. -a - append, -w - overwrite.`,
  },
  new: {
    about: `create new file or directory. you can use it like this: new 'file_path'.`,
  },
  ls: {
    about: `list files in directory. you can use it like this: ls ['directory_path']. If no path is specified, it will list files in the current directory.`,
  },
  connect: {
    about: `connect to server. you can use it like this: connect 'server_name'.`,
  },
  disconnect: {
    about: `disconnect from server. you can use it like this: disconnect.`,
  },
  run: {
    about: `run program from file. you can use it like this: run 'program_file_path'.`,
  },
  cls: {
    about: `clear terminal. you can use it like this: cls.`,
  },
  ping: {
    about: `check server availability. you can use it like this: ping 'server_name' or ping -s for current server.`,
  },
  diag: {
    about: `diagnose server state. you can use it like this: diag 'server_name' or diag -s for current server.`,
  },
  svstorage: {
    about: `repair server storage. you can use it like this: svstorage 'server_name' or svstorage -s for current server.`,
  },
  svio: {
    about: `repair server I/O. you can use it like this: svio 'server_name' or svio -s for current server.`,
  },
  svnet: {
    about: `repair server network. you can use it like this: svnet 'server_name' or svnet -s for current server.`,
  }
}

const commands = {
  help: (args) => {
    if (args.length === 0) {
      return "list of commands:\n" +
      "int 'var_name' 'value' - create integer variable\n" +
      "str 'var_name' 'value' - create string variable\n" +
      "printf 'var_name' - print variable content\n" +
      "echo 'text' - print text to terminal\n" +
      "read 'file_path' - read file content\n" +
      "write 'file_path' [-a|-w] <content> - write content to file (append or overwrite)\n" +
      "new 'file_path' - create new file or directory\n" +
      "ls ['directory_path'] - list files in directory\n" +
      "connect 'server_name' - connect to server\n" +
      "disconnect - disconnect from server\n" +
      "run 'program_file_path' - run program from file\n" +
      "cls - clear terminal\n" +
      "ping 'server_name' - check server availability\n" +
      "diag 'server_name' - diagnose server state\n" +
      "storage 'server_name' - repair server storage\n" +
      "io 'server_name' - repair server I/O\n" +
      "net 'server_name' - repair server network\n" +
      "help - show this help message\n" +
      "about - show information about the terminal\n" +
      "cls - clear the terminal\n" +
      "For more information about a specific command, use 'help <command_name>'.";
      
    } else if (args.length === 1) {
      const cmd = args[0];
      if (commands[cmd]) {
        return `Command: ${cmd}\nDescription: ${cmd_descriptions[cmd].about || "No description available."}`;
      } else {
        return `error: command "${cmd}" not found`;
      }
    }

  },
  about: "Простой терминал, написанный на чистом JavaScript.",
  clear: "clear",
  open: (args) => {
    // функция для открытия программы
    // args[0] - имя программы
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    const programName = args[0];
    // проверка на существование программы
    if (!SYSTEM.programs[programName]) {
      return `error: program "${programName}" not found`;
    }
    // открытие программы
    loadPage(SYSTEM.programs[programName].page);},
  int: (args) => {
    // функция создания целочисленной переменной
    // args[0] - имя переменной
    // args[1] - значение переменной
    if (args.length < 2) {
      return "error: not enough arguments";
    }
    const varName = args[0];
    const varValue = args[1];
    // проверка на существование переменной
    if (SYSTEM.vars[varName]) {
      return `error: variable "${varName}" already exists`;
    }
    // создание переменной
    SYSTEM.vars[varName] = {
      "content": varValue,
      "type": "integer"
    };
  },
  str: (args) => {
    // функция создания строковой переменной
    // args[0] - имя переменной
    // args[1] - значение переменной
    if (args.length < 2) {
      return "error: not enough arguments";
    }
    const varName = args[0];
    const varValue = args.slice(1).join(" ");
    // проверка на существование переменной
    if (SYSTEM.vars[varName]) {
      return `error: variable "${varName}" already exists`;
    }
    // создание переменной
    SYSTEM.vars[varName] = {
      "content": varValue,
      "type": "string"
    };
  },
  printf: (args) => {
    // функция для вывода переменной в терминал
    // args[0] - имя переменной
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    const varName = args[0];
    // проверка на существование переменной
    if (!SYSTEM.vars[varName]) {
      return `error: variable "${varName}" not defined`;
    }
    // вывод переменной в терминал
    return SYSTEM.vars[varName].content;
  },
  ping: (args) => {
    // функция для доступности сервера
    // args[0] - имя сервера или -s для текущего сервера
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    // проверка на доступность сервера
    const server = SYSTEM.servers[serverName];
    if (server.systems.state === "100") {
      return `Server "${serverName}" is online.`;
    } else {
      return `Server "${serverName}" is offline.`;
    }
  },
  diag: (args) => {
    // функция для диагностики системы
    // args[0] - имя сервера или -s для текущего сервера
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    // вывод состояния системы
    const server = SYSTEM.servers[serverName];
    return `Server "${serverName}" diagnostics:\n` +
           `State: ${server.systems.state}\n` +
           `IO: ${server.systems.io}\n` +
           `RAM: ${server.systems.ram}\n` +
           `CPU: ${server.systems.cpu}\n` +
           `Network: ${server.systems.network}`;
  },
  storage: (args) => {
    // функция для починки памяти сервера
    // args[0] - имя сервера или -s для текущего сервера
    // args[1] - действие с памятью
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    if (args[1] == "check") {
      // проверка состояния памяти сервера
      const server = SYSTEM.servers[serverName];
      return `Server "${serverName}" RAM state: ${server.systems.ram}`;
    }

    if (args[1] == "repair") {
      // починка памяти сервера
      const server = SYSTEM.servers[serverName];
      server.systems.ram = "100";
      return `Server "${serverName}" RAM repaired successfully.`;
    }
  },
  io: (args) => {
    // функция для починки ввода-вывода сервера
    // args[0] - имя сервера или -s для текущего сервера
    // args [1] - действие с io
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    if (args[1] == "check") {
      // проверка состояния ввода-вывода сервера
      const server = SYSTEM.servers[serverName];
      return `Server "${serverName}" I/O state: ${server.systems.io}`;
    }

    if (args[1] == "repair") {
      // починка ввода-вывода сервера
      const server = SYSTEM.servers[serverName];
      server.systems.io = "100";
      return `Server "${serverName}" I/O repaired successfully.`;
    }
  },
  net: (args) => {
    // функция для починки сети сервера
    // args[0] - имя сервера
    // args[1] - действие с сетью
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    if (args[1] == "check") {
      // проверка состояния сети сервера
      const server = SYSTEM.servers[serverName];
      return `Server "${serverName}" Network state: ${server.systems.network}`;
    }
    if (args[1] == "repair") {
      // починка сети сервера
      const server = SYSTEM.servers[serverName];
      server.systems.network = "100";
      return `Server "${serverName}" Network repaired successfully.`;
    }
  },
  ram: (args) => {
    // функция для починки оперативной памяти сервера
    // args[0] - имя сервера или -s для текущего сервера
    // args[1] - действие с оперативной памятью
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    if (args[1] == "check") {
      // проверка состояния оперативной памяти сервера
      const server = SYSTEM.servers[serverName];
      return `Server "${serverName}" RAM state: ${server.systems.ram}`;
    }

    if (args[1] == "repair") {
      // починка оперативной памяти сервера
      const server = SYSTEM.servers[serverName];
      server.systems.ram = "100";
      return `Server "${serverName}" RAM repaired successfully.`;
    }
  },
  cpu: (args) => {
    // функция для починки процессора сервера
    // args[0] - имя сервера или -s для текущего сервера
    // args[1] - действие с процессором
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    let serverName = args[0];
    if (serverName === "-s") {
      serverName = SYSTEM.vars["__server__"] ? SYSTEM.vars["__server__"].content : "";
    }
    // проверка на существование сервера
    if (!SYSTEM.servers[serverName]) {
      return `error: server "${serverName}" not found`;
    }
    if (args[1] == "check") {
      // проверка состояния процессора сервера
      const server = SYSTEM.servers[serverName];
      return `Server "${serverName}" CPU state: ${server.systems.cpu}`;
    }

    if (args[1] == "repair") {
      // починка процессора сервера
      const server = SYSTEM.servers[serverName];
      server.systems.cpu = "100";
      return `Server "${serverName}" CPU repaired successfully.`;
    }
  },
  echo: (args) => args.join(" "),
  read: (args) => {
    // функция для чтения файла
    // args[0] - путь к файлу
    // проверка на наличие аргументов
    src = args[0];
    
    // разделение пути на части и копирование дома в переменную dom
    src = src.split("/")
    if (src[0] === ".") {
      src = SYSTEM.vars["__path__"].content + "/" + src[1];
      src = src.split("/");
    }
    dom = SYSTEM.explorer;

    //проходим по частям пути и проверяем, существует ли файл или директория
    for (let i = 0; i < src.length; i++) {
      if (!dom[src[i]]) {
        return `error: file or directory "${src[i]}" not found`;
      }
      // если это последний элемент пути, то возвращаем содержимое файла
      dom = dom[src[i]];
    }
    return dom["content"] ? dom["content"] : `error: "${args[0]}" is not a file`;
  },
  write: (args) => {
    // функция для записи в файл
    // args[0] - путь к файлу
    //args[1] - флаг, если есть
    // args[2] - содержимое файла
    if (args.length < 2) {
      return "error: not enough arguments";
    }
    
    src = args[0];
    content = args.slice(2).join(" ");

    // разделение пути на части и копирование дома в переменную dom
    src = src.split("/");
    if (src[0] === ".") {
      src = SYSTEM.vars["__path__"].content + "/" + src[1];
      src = src.split("/");
    }
    dom = SYSTEM.explorer;

    // проходим по частям пути и проверяем, существует ли файл или директория
    for (let i = 0; i < src.length - 1; i++) {
      if (!dom[src[i]]) {
        return `error: directory "${src[i]}" not found`;
      }
      dom = dom[src[i]];
    }

    // если это последний элемент пути, то записываем содержимое файла, иначале возвращаем ошибку
    if (dom[src[src.length - 1]]) {
      if (args[1] === "-a") {
        // если флаг -a, то добавляем содержимое к существующему
        dom[src[src.length - 1]]["content"] += "\n" + content;
      } else if (args[1] === "-w") {
        // если флаг -w, то перезаписываем содержимое
        dom[src[src.length - 1]]["content"] = content;
      } else {
        // если флаг не указан, то перезаписываем содержимое
        dom[src[src.length - 1]]["content"] = content;
      }
      return `file "${src[src.length - 1]}" updated successfully`;
    } else {
      return `error: file "${src[src.length - 1]}" not found`;
    }
  },
  del: (args) => {
    // функция для удаления файла или директории
    // args[0] - путь к файлу или директории
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    
    src = args[0];
    src = src.split("/");
    if (src[0] === ".") {
      src = SYSTEM.vars["__path__"].content + "/" + src[1];
      src = src.split("/");
    }
    dom = SYSTEM.explorer;

    // проходим по частям пути и проверяем, существует ли файл или директория
    for (let i = 0; i < src.length - 1; i++) {
      if (!dom[src[i]]) {
        return `error: directory "${src[i]}" not found`;
      }
      dom = dom[src[i]];
    }

    // если это последний элемент пути, то удаляем файл или директорию
    if (dom[src[src.length - 1]]) {
      delete dom[src[src.length - 1]];
      return `file or directory "${src[src.length - 1]}" deleted successfully`;
    } else {
      return `error: file or directory "${src[src.length - 1]}" not found`;
    }
  },
  new: (args) => {
    // функция для создания нового файла или директории
    // args[0] - путь к файлу или директории
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    
    src = args[0];
    src = src.split("/");
    if (src[0] === ".") {
      src = SYSTEM.vars["__path__"].content + "/" + src[1];
      src = src.split("/");
    }
    dom = SYSTEM.explorer;

    // проходим по частям пути и проверяем, существует ли файл
    for (let i = 0; i < src.length - 1; i++) {
      if (!dom[src[i]]) {
        return `error: directory "${src[i]}" not found`;
      }
      dom = dom[src[i]];
    }

    // если это последний элемент пути, то создаем файл
    if (!dom[src[src.length - 1]]) {
      dom[src[src.length - 1]] = {
        "content": "\n",
        "type": "text"
      };
      return `file "${src[src.length - 1]}" created successfully`;
    } else {
      return `error: file "${src[src.length - 1]}" already exists`;
    }
  },
  ls : (args) => {
    // функция для вывода списка файлов и директорий
    // args[0] - путь к директории
    // args[1] - флаг или пароль
    src = args[0] || "root"; // если не указан путь, то по умолчанию root
    src = src.split("/");
    if (src[0] === ".") {
      src = SYSTEM.vars["__path__"].content;
      src = src.split("/");
    }
    dom = SYSTEM.explorer;

    // проходим по частям пути и проверяем, существует ли директория
    for (let i = 0; i < src.length; i++) {
      if (!dom[src[i]]) {
        return `error: directory "${src[i]}" not found`;
      }
      // проверим есть ли в разделе фаил _cfg_
      if (src[i] === ".cfg") {
        // серим введённый пароль с паролем из фала в строчке access
        

      }
      dom = dom[src[i]];
    }

    // обновляем переменную __path__
    SYSTEM.vars["__path__"] = {
      "content": src.join("/"),
      "type": "string"
    };

    // обновим путь в строке ввода
    const pathElement = document.getElementById("path");
    if (pathElement) {
      pathElement.textContent = `${SYSTEM.vars["__path__"].content} $:`;
    }

    // возвращаем список файлов и директорий
    printToTerminal(`You in "${src.join("/")}"`);
    return Object.keys(dom).length > 0 ? Object.keys(dom).join("\n") : "Directory is empty";
  },
  connect: (args) => {
    const serverName = args[0];

    // обновляем переменную __server__
    SYSTEM.vars["__server__"] = {
      "content": serverName,
      "type": "string"
    };

    dom = SYSTEM.explorer;
    dom_server = SYSTEM['servers'][serverName]["master"];
    // функция для подключения к серверу
    // args[0] - имя сервера
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    
    
    printToTerminal(`Connecting to server "${serverName}"...`);
    // если с сетью сервера что-то не так то подключение будет очень долгим

    if (SYSTEM.servers[serverName]) {
      setTimeout(() => {
        SYSTEM.explorer.root["server"] = dom_server; // добавляем корневой каталог сервера в систему
        return `Connected to ${SYSTEM.servers[serverName].name} at ${SYSTEM.servers[serverName].ip}:${SYSTEM.servers[serverName].port}`;} , (10000 - Number(SYSTEM.servers[serverName].systems.network) * 100)
        ); // задержка для имитации подключения к серверу
    } else {
      return `error: server "${serverName}" not found`;
    }
  },
  disconnect: () => {
    // обновляем переменную __server__
    SYSTEM.vars["__server__"] = {
      "content": "",
      "type": "string"
    };

    // функция для отключения от сервера
    if (SYSTEM.explorer.root["server"]) {
      delete SYSTEM.explorer.root["server"];
      return "Disconnected from server";
    } else {
      return "error: not connected to any server";
    }
  },
  run: (args) => {
    // функция для выполнения программы
    // args[0] - имя файла программы
    if (args.length < 1) {
      return "error: not enough arguments";
    }
    
    const programName = args[0];
    let src = programName.split("/");
    if (src[0] === ".") {
      src = SYSTEM.vars["__path__"].content + "/" + src[1];
      src = src.split("/");
    }
    let dom = SYSTEM.explorer;
    //проходим по частям пути и проверяем, существует ли файл или директория
    for (let i = 0; i < src.length; i++) {
      if (!dom[src[i]]) {
        return `error: file or directory "${src[i]}" not found`;
      }
      // если это последний элемент пути, то возвращаем содержимое файла
      dom = dom[src[i]];
    }
    const program = dom["content"] ? dom["content"] : `error: "${args[0]}" is not a file`;

    printToTerminal(`Running program "${programName}"...`);
    initRunTime(program);
    return `Program "${programName}" executed successfully`;
  }
};

function printToTerminal(text) {
  terminal.innerHTML += text + "\n";
  terminal.scrollTop = terminal.scrollHeight;
}

function RandomINT(min, max) {
  // функция для генерации случайного целого числа
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleCommand(inputString) {

  // с n-вераятностью должна выдти из строя система m-сервера
  if (Math.random() < 0.5) {
    let r = RandomINT(0, 4);
    m_server = Math.floor(Math.random() * Object.keys(SYSTEM.servers).length);
    const serverName = Object.keys(SYSTEM.servers)[m_server];
    r_dmg = RandomINT(1, 20)
    if (r === 0) {
      result = String(Number(SYSTEM.servers[serverName].systems.state) - 1); // сбой системы
      SYSTEM.servers[serverName].systems.state = result; // сбой системы
    }

    if (r === 1) {
      result = String(Number(SYSTEM.servers[serverName].systems.io) - 1); // сбой ввода-вывода
      SYSTEM.servers[serverName].systems.io = result; // сбой ввода-вывода
      
    }
    
    if (r === 2) {
      result = String(Number(SYSTEM.servers[serverName].systems.network) - 1); // сбой сети
      SYSTEM.servers[serverName].systems.network = result; // сбой сети
    }

    if (r === 3) {
      result = String(Number(SYSTEM.servers[serverName].systems.ram) - 1); // сбой оперативной памяти
      SYSTEM.servers[serverName].systems.ram = result; // сбой оперативной памяти
    }

    if (r === 4) {
      result = String(Number(SYSTEM.servers[serverName].systems.cpu) - 1); // сбой процессора
      SYSTEM.servers[serverName].systems.cpu = result; // сбой процессора
    }
  }

  const [cmd, ...args] = inputString.trim().split(" ");
  if (cmd === "cls") {
    terminal.innerHTML = "";
    return;
  }

  if (commands[cmd]) {
    const output = typeof commands[cmd] === "function"
      ? commands[cmd](args)
      : commands[cmd];
    if (output !== undefined) {
      printToTerminal(output);
    }
    localStorage.setItem("system", JSON.stringify(SYSTEM));
  } else if (cmd.length > 0) {
    printToTerminal(`Syntax error, command "<b>${cmd}</b>" is not exist`);
  }
}
 function initTerminal() {
  SYSTEM = JSON.parse(localStorage.getItem("system"));
  printToTerminal("Welcome to the terminal!");
  printToTerminal("Type 'help' for a list of commands.");
  printToTerminal(`Sorry for many bugs, this is demo version`);
    const terminal = document.getElementById("terminal");
    const input = document.getElementById("commandInput");

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const value = input.value.trim();
        if (value !== "") {
          printToTerminal(`${SYSTEM.vars["__path__"].content} $: ${value}`);
          handleCommand(value);
          input.value = "";
        }
      }
    });}

function initRunTime(program) {
  let queue = program.split("\n");
  for (let i = 0; i < queue.length; i++) {
    handleCommand(queue[i]);
  }
}

function sendMessageToMail(Author, Subject, Message) {
  // функция отправки сообщения на почту
  // Author - автор сообщения
  // Subject - название файла
  // Message - текст сообщения
  if ((Subject.split(" ")).length === 1) {
  SYSTEM.explorer.root.mail[Subject] = {
    "content": `${Message}\n\nFrom: ${Author}`,
    "type": "text"
    }
  };
}

function giveErrorToServer(serverName, errorName) {
  // функция для выдачи ошибки серверу
  // serverName - имя сервера
  // errorName - имя ошибки
  console.log(ERRORS.server_errors[errorName])
  SYSTEM.servers[serverName].errors.push(ERRORS.server_errors[errorName].name);
  console.log(`Error "${errorName}" added to server "${serverName}"`);
  // проверка на наличие условий для ошибки
  // обновляем локальное хранилище
  localStorage.setItem("system", JSON.stringify(SYSTEM));

}

function createServer(name, ip, port, master = {"documents": {}}) {
  // функция создания сервера, не для вызова из консоли
  SYSTEM.servers[name] = {
    "name": name, // имя сервера
    "ip": ip, // IP адрес сервера
    "port": port, // порт сервера
    "master": master, // корневой каталог сервера
    "systems" : {
      "state": "100", // состояние системы
      "io": "100", // состояние ввода-вывода
      "ram": "100", // состояние оперативной памяти
      "cpu": "100", // состояние процессора
      "network": "100" // состояние сети
    },
  }
}

function loadPage(page) {
    
    const content = document.getElementById('desktop');
    switch (page) {

      case 'home':
        content.innerHTML = mainPage();
        break;

    case 'systemInit':
        content.innerHTML = systemInitPage();
        // инициализация системы
        setTimeout(() => {
          loadPage('terminal');
        }, 3000);
        break;
    
    case "doc":
        content.innerHTML = docPage();
        break;      
        
    case 'terminal':
        content.innerHTML = terminalPage();
        initTerminal();
        break;

    case 'desktop':
        content.innerHTML = loadDesktop();
        break;

      default:
        content.innerHTML = mainPage();
    }
  }

function docPage() {
  return `
  <h1>Документация</h1>`;
}


function systemInitPage() {
    return `
    <div class="content" align="center">
      <h1>Добро пожаловать</h1>
    </div>`;

  }

  function mainPage() {
    return `
    <h1>Главная страница</h1>
    <button onclick="loadPage('terminal')">Перейти к терминалу</button>
        `;
  }



function terminalPage() {
    return `
        <div id="content">
            <div id="terminal"></div>
            <div class="input-line">
              <span id="path" class="prompt">${SYSTEM.vars["__path__"].content} $:</span>
              <input type="text" id="commandInput" autocomplete="off" autofocus />
            </div>
        </div>

        <div class="bar">
            <button class="bar_button" onclick='loadPage("desktop")'>desktop</button>
        </div>

    `;
}

function loadDesktop() {
  return `
            <div id="window">
              <div class="app">
                  <button onclick='loadPage("terminal")'><img src="img/termonal.png" alt=">_"></button>
              </div>
            
            
          </div>
          <div class="bar">
              <button class="bar_button" onclick='loadPage("desktop")'>desktop</button>
          </div>`;
}
