import { format } from "date-fns";

export const formatDate12Hours = (dateString: string) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;
  return `${month}/${day}/${year} ${hour}:${minute} ${ampm}`;
  //Example return value: 05/14/2025 5:24 PM
};

export const formatDate = (dateStr: string, formatStr = "MM/dd/yyyy") => {
  if (!dateStr) return;
  return format(new Date(dateStr), formatStr);
};
