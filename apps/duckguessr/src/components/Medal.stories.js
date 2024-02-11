import Medal from "~/components/Medal";
import { MedalLevelAndProgress } from "~duckguessr-types/playerStats";

export default {
  title: "Medal",
};

const Template = (args) => ({
  components: { Medal },
  setup() {
    return { args };
  },
  template: '<Medal v-bind="args" />',
});
export const GoldPlus100Points = Template.bind({});
GoldPlus100Points.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(3, 100, 0),
  type: "published-fr-recent",
};
export const Gold = Template.bind({});
Gold.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(3, 0, 0),
  type: "published-fr-recent",
};
export const GoldItalian = Template.bind({});
GoldItalian.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(3, 0, 0),
  type: "it",
};
export const GoldAmerican = Template.bind({});
GoldAmerican.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(3, 0, 0),
  type: "us",
};
export const SilverPlus10Points = Template.bind({});
SilverPlus10Points.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 10, 0),
  type: "published-fr-recent",
};
export const SilverPlus90Points = Template.bind({});
SilverPlus90Points.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 90, 0),
  type: "published-fr-recent",
};
export const SilverPlus90PointsProgress20Points = Template.bind({});
SilverPlus90PointsProgress20Points.args = {
  type: "published-fr-recent",
  withGameData: true,
  medalLevelAndProgress: new MedalLevelAndProgress(2, 90, 20),
};

export const Silver = Template.bind({});
Silver.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 0, 0),
  type: "fast",
};
export const Bronze = Template.bind({});
Bronze.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(1, 0, 0),
  type: "ultra_fast",
};
export const NoMedalPlus20Points = Template.bind({});
NoMedalPlus20Points.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(0, 3, 5),
  withGameData: true,
  type: "ultra_fast",
};
export const NoMedal = Template.bind({});
NoMedal.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(0, 0, 0),
  type: "ultra_fast",
};
