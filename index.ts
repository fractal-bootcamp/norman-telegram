import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { PrismaClient } from "@prisma/client";

import readline from "readline";

const prisma = new PrismaClient();
const apiId = 27354197;
const apiHash = "de1f90fc8d3b7ae2c2ec6c7463086757";
const stringSession = new StringSession(
  "1AQAOMTQ5LjE1NC4xNzUuNTEBuwFGaJfCol90zf7QZ5y8Usxu0FDIHpJDrOLlvQjxmq0q6eQwqOGcpLMzfUXadOcDXBg0XpcnXYJc6Zsx8anHqpe/+nmz21sFKKTHtH+jmZZ9k/+eO9d1U8duJjubBm7uWrkWt/sV1jRaYOcfK0JqsBYjebxPxeTP/16kn75q4EbIliW+GKcAObwRtx5pshjHKRvwjVeZ+XESjeL42/GC7SH/5NF8SrN1KpUqf+bQFerwCJrIlqROCQWO5X/pkYv1nvl5fNtp2i8nu6FXjJGGdjlFyESLTMWA5PVgy9mN5ee84KiT58MhuJOVMCtiNlkbGMKIZQl2f3KqQOeatJTUDhI="
); // fill this later with the value from session.save()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your number: ", resolve)
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your password: ", resolve)
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Please enter the code you received: ", resolve)
      ),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  await client.sendMessage("me", { message: "Hello!" });

  //console.log(result);

  let helper = [];
  for (let i = 0; i < 10000; i += 100) {
    console.log("looped");
    helper = await client.invoke(
      new Api.messages.GetHistory({
        offsetId: i, //change offsets to get every message
        peer: -1002083186778,
        limit: 150,
      })
    );

    const prep = helper.messages.filter((element) => element.fromId != null);

    const idDateMessage = prep.map((element) =>
      element.message != null
        ? [element.fromId.userId.value, element.date, element.message]
        : [element.fromId.userId.value, element.date, "message missing"]
    );

    for (let j = 0; j < idDateMessage.length; j++) {
      await prisma.message.create({
        data: {
          sender: idDateMessage[j][0],
          time: idDateMessage[j][1],
          message: idDateMessage[j][2],
        },
      });
    }
  }
  prisma.message.findMany({}).then((response) => console.log(response));
  async () => {
    await prisma.$disconnect();
  };
})();
