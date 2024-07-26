type issue = {
  country: string;
  magazine: string;
  publicationcode: string
  shortIssuenumber: string;
};

export const computeShortIssuecodeFromCountryMagazineIssuenumber = {
  shortIssuecode: {
    needs: {
      country: true,
      magazine: true,
      shortIssuenumber: true,
    },
    compute: ({
      country,
      magazine,
      shortIssuenumber,
    }: Pick<issue, 'country'|'magazine'|'shortIssuenumber'>) => `${country}/${magazine} ${shortIssuenumber}`,
  },
};