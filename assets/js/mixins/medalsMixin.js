import axios from "axios";

const MEDAL_LEVELS = {
    Photographe: {1: 50, 2: 150, 3: 600},
    Createur: {1: 20, 2: 70, 3: 150},
    Duckhunter: {1: 1, 2: 3, 3: 15}
};

const RADIUS = 42

export default {
    data() {
        return {
            radius: RADIUS,
            circumference: Math.PI * RADIUS * 2,
        }
    },

    async mounted() {
        const vm = this
        this.userPoints = (await axios.get("/collection/points")).data.map(pointDetailsForLevel => {
            const { contribution, points_total: userPoints } = pointDetailsForLevel
            const level = MEDAL_LEVELS[contribution];
            const maxThresholdReached = Object.values(level).filter(minimumPoints => userPoints >= minimumPoints).pop()
            const levelReached = parseInt(Object.keys(level).find(key => level[key] === maxThresholdReached))

            let pointsDiffNextLevel, levelProgressPercentage
            if (levelReached < 3) {
                const currentLevelThreshold = levelReached === 0 ? 0 : level[levelReached]
                const nextLevelThreshold = level[levelReached+1]
                pointsDiffNextLevel = nextLevelThreshold - userPoints
                const levelProgress = (userPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold) || .01
                levelProgressPercentage = (1 - levelProgress) * vm.circumference
            }
            return {
                contribution,
                userPoints,
                levelReached,
                pointsDiffNextLevel: pointsDiffNextLevel || null,
                levelProgressPercentage: levelProgressPercentage || null
            }
        })
    }
}