export default () => ({
  resolveIssueNumberTemplate: (text: string, issuenumber: string) =>
    !text ? text : text.replaceAll(/\[Numero]/g, issuenumber),

  resolveIssueNumberPartTemplate: (text: string, issuenumber: string) =>
    !text
      ? text
      : text.replaceAll(
          /\[Numero\[(\d)]]/g,
          (_match, digitIndex: number) => issuenumber[digitIndex],
        ),
  resolveHeightTemplate: (text: string, height: number) =>
    !text
      ? text
      : text.replaceAll(/\[Hauteur]\*([.0-9]+)/g, (_match, coefficient) =>
          (height * coefficient).toString(),
        ),
});
