const express = require("express");
const app = express();

const { get, set, setnx, incrby, exists } = require("./model.redis");

app.get("/order", async (req, res) => {
  const time = new Date().getTime();

  const slTonKho = 10;
  const keyName = "iPhone13";
  const slMua = 1;

  const getKey = await exists(keyName);
  if (!getKey) {
    await set(keyName, 0);
  }

  // Lay so luong ban ra
  let slBanRa = await get(keyName);

  // Neu so luong ban ra + so luong mua > slTonKho => return false
  if (slBanRa + slMua > slTonKho) {
    console.log("HET HANG");
    return;
  }

  //   Neu order thanh cong
  slBanRa = await incrby(keyName, slMua);
  if(slBanRa > slTonKho) {
    await set("banquaroi", slBanRa - slTonKho);
  }

  return res.json({
    status: "success",
    msg: "Ok",
    time,
  });
});
