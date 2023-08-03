const months = {
  янв: 1,
  фев: 2,
  мар: 3,
  апр: 4,
  мая: 5,
  июн: 6,
  июл: 7,
  авг: 8,
  сен: 9,
  окт: 10,
  ноя: 11,
  дек: 12,
};

function pad(number) {
  if (typeof number === "string") {
    if (number.length > 1) return number;
    return "0" + number;
  }
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

function getFullMonth(variant) {
  for (key in months) {
    if (variant.includes(key)) return months[key];
  }
}

function geneateISODateString({ year, month, date, hour, min, sec, mil }) {
  return new Date(
    `${year}-${pad(month)}-${pad(date)}T${hour ?? "00"}:${min ?? "00"}:${
      sec ?? "00"
    }.${mil ?? "000"}Z`
  ).toISOString();
}

const firstReg =
  /((?<year>(19|20)\d{2})(\/|-|.)(?<month>0[1-9]|1[1-2])(\/|-|.)(?<date>[1-3]\d|0?[1-9])T(?<hour>0|1\d|2[0-4]):(?<min>[0-6]\d):(?<sec>[0-6]\d).(?<mil>\d{3})\+(?<timezone>([0-2]\d):([0-6]\d)))|((?<yearShort>(19|20)\d{2})(\/|-|.)(?<monthShort>0[1-9]|1[1-2])(\/|-|.)(?<dateShort>0[1-9]|[1-3]\d)\+(?<timezoneShort>([0-2]\d):([0-6]\d)))/;

const secondReg =
  /(?<date>[1-3]\d|0?[1-9])(-|.|\/)(?<month>0[1-9]|1[1-2])(-|.|\/)(?<year>(19|20)\d{2})(.*?(?<hour>0|1\d|2[0-4]):(?<min>[0-6]\d))?/;

const thirdReg =
  /(?<year>(19|20)\d{2})(-|.)(?<month>0[1-9]|1[1-2])(-|.)(?<date>[1-3]\d|0?[1-9])(.*?(?<hour>0|1\d|2[0-4]):(?<min>[0-6]\d)(:?(?<sec>[0-6]\d).?(?<mil>\d{3})?)?)?/;

const fullMonthReg = /(?<date>[1-3]\d|0?[1-9]).*(?<year>(19|20)\d{2})/;

function source({ src, options }) {
  const variant = src[options];

  if (firstReg.test(variant)) {
    const parsed = firstReg.exec(variant);

    let newDate;

    if (parsed.groups.yearShort) {
      const { yearShort, monthShort, dateShort, timezoneShort } = parsed.groups;

      newDate = new Date(
        `${yearShort}-${monthShort}-${dateShort}T00:00:00.000+${timezoneShort}`
      );
    } else {
      newDate = new Date(variant);
    }

    const result = `${newDate.getFullYear()}-${pad(
      newDate.getMonth() + 1
    )}-${pad(newDate.getDate())}T${pad(newDate.getHours())}:${pad(
      newDate.getMinutes()
    )}:${pad(newDate.getSeconds())}.${(newDate.getMilliseconds() / 1000)
      .toFixed(3)
      .slice(2, 5)}+${pad(-newDate.getTimezoneOffset() / 60)}:${pad(0)}`;

    return result;
  }

  if (secondReg.test(variant)) {
    const parsed = secondReg.exec(variant);
    return geneateISODateString({ ...parsed.groups });
  }

  if (thirdReg.test(variant)) {
    const parsed = thirdReg.exec(variant);

    return geneateISODateString({ ...parsed.groups });
  }

  if (fullMonthReg.test(variant)) {
    const parsed = fullMonthReg.exec(variant);

    const month = getFullMonth(variant);

    return geneateISODateString({ ...parsed.groups, month });
  }
}

module.exports = source;
