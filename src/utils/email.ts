import axios from "axios";

export async function sendMagicLinkMail(
  link: string,
  email: string,
  client: string,
  device: string,
  time: string,
  date: string,
) {
  const res = await axios.post(
    "https://app.loops.so/api/v1/transactional",
    {
      email: email,
      transactionalId: "clutlj79m00gi4au20mjxg8c8",
      dataVariables: {
        verification_link: link,
        email,
        client,
        device,
        time,
        date,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LOOPS_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  console.log(res.data);
  return res.data;
}

export async function subscribeToEvents(email: string) {
  try {
    const res = await axios.post(
      "https://app.loops.so/api/v1/contacts/create",
      {
        email: email,
        subscribed: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LOOPS_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("resdata", res.data);
    return res.data;
  } catch (e) {
    console.log("error", e);
  }
}
