type issue = {
  country: string;
  magazine: string;
  publicationcode: string
  issuenumber: string;
};

export const computeShortIssuecodeFromCountryMagazineIssuenumber = {
  shortIssuecode: {
    needs: {
      country: true,
      magazine: true,
      issuenumber: true,
    },
    compute: ({
      country,
      magazine,
      issuenumber,
    }: Pick<issue, 'country'|'magazine'|'issuenumber'>) => `${country}/${magazine} ${issuenumber}`,
  },
};