import axios from "axios";
import qs from "qs";
import cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();
const URI = process.env.URI;
const VIEWSTATE = process.env.VIEWSTATE;
const VIEWSTATEGENERATOR = process.env.VIEWSTATEGENERATOR;

async function fetchResult(studentData) {
  let data = qs.stringify({
    __EVENTTARGET: "btnSearch",
    __VIEWSTATE:VIEWSTATE,
    __VIEWSTATEGENERATOR: VIEWSTATEGENERATOR,
    ddlInst: studentData.ddlInst,
    ddlDegree: studentData.ddlDegree,
    ddlSem: studentData.ddlSem,
    ddlScheduleExam: studentData.ddlScheduleExam,
    txtEnrNo: studentData.txtEnrNo,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: URI,
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "content-type": "application/x-www-form-urlencoded",
      },
    data: data,
  };

  try {
    const response = await axios(config);
    return response.data; // returns the html content
  } catch (error) {
    console.log(error);
    throw new Error(`Error found : ${response.status}`);
  }
}

function parseHtml(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const Name =
    $('td:contains("Name")').next("td").next("td").text().trim() || null;
  const ID = $('td:contains("ID. No.")').next("td").next("td").text().trim();
  const Programme = $('td:contains("Programme")')
    .next("td")
    .next("td")
    .text()
    .trim();
  const Time = $('td:contains("Month & Year")')
    .next("td")
    .next("td")
    .text()
    .trim();
  const semester = $("#uclGrd1_lblSemester").text();
  const SGPA = $("#uclGrd1_lblSGPA").text();
  const CGPA = $("#uclGrd1_lblCGPA").text();
  const PrevSGPA = $("#uclGrd1_lblPreviousSGPA").text().trim();
  const PrevCGPA = $("#uclGrd1_lblPreviousCGPA").text().trim();

  return{
    Name,
    ID,
    Programme,
    Time,
    semester,
    SGPA,
    CGPA,
    PrevSGPA,
    PrevCGPA
  }

}

async function main() {
  console.log("Script starts");
  // Inst : 1 for CSPIT, 21 for DEPSTAR
  // Degree : 39 for CE, 40 for EC, 134 for DCSE, 132 for DCE
  // ScheduleExam : 6785 for CE-CSPIT, 6790 for EC-CSPIT, 6789 for CSE-DEPSTAR
  const data = {
    ddlInst: "21",
    ddlDegree: "134",
    ddlSem: "6",
    ddlScheduleExam: "6789",
    txtEnrNo: "21DCS085",
  };

  try{
    const result = await fetchResult(data);
    const parse = parseHtml(result);
    console.log(`Name: ${parse.Name}`);
    console.log(`ID: ${parse.ID}`);
    console.log(`Programme: ${parse.Programme}`);
    console.log(`Time: ${parse.Time}`);
    console.log(`Semester: ${parse.semester}`);
    console.log(`SGPA: ${parse.SGPA}`);
    console.log(`CGPA: ${parse.CGPA}`);
    console.log(`PrevCGPA: ${parse.PrevCGPA}`);
    console.log(`PrevSGPA: ${parse.PrevSGPA}`);
  }catch(error){
    console.log(error);
  }finally{
    console.log("Script ends");
  }
}
main();
