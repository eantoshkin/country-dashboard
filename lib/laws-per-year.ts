export interface LawsPerYearValue {
  year: number;
  count: number;
  partial?: boolean;
  asOf?: string;
}

export function summarizeLawsPerYear(data: readonly LawsPerYearValue[]) {
  if (data.length === 0) {
    return {
      yearRange: "No yearly data",
      spokenYearRange: "with no yearly data",
      partialNote: "",
      valueSummary: "no yearly totals available",
    };
  }

  const first = data[0];
  const last = data[data.length - 1];
  const full = data.filter((value) => !value.partial);
  const peakPool = full.length > 0 ? full : data;
  const peak = peakPool.reduce((highest, value) =>
    value.count > highest.count ? value : highest,
  );
  const partial = data.filter((value) => value.partial);
  const partialNote = partial.length
    ? ` (* ${partial
        .map((value) =>
          value.asOf
            ? `${value.year} to ${value.asOf}`
            : `${value.year} partial`,
        )
        .join("; ")})`
    : "";
  const values = [`${first.count} in ${first.year}`];

  if (peak !== first) values.push(`a peak of ${peak.count} in ${peak.year}`);
  values.push(
    ...partial.map(
      (value) =>
        `${value.count} so far in the partial year ${value.year}${
          value.asOf ? ` through ${value.asOf}` : ""
        }`,
    ),
  );

  return {
    yearRange:
      first.year === last.year ? `${first.year}` : `${first.year}–${last.year}`,
    spokenYearRange:
      first.year === last.year
        ? `in ${first.year}`
        : `from ${first.year} to ${last.year}`,
    partialNote,
    valueSummary: values.join(", with "),
  };
}
