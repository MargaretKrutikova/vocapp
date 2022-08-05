import type { NextApiRequest, NextApiResponse } from "next";

const healthcheck = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json("Healthy");
};

export default healthcheck;
