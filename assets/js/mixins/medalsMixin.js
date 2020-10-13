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
    methods: {
        async getUserStats(userIds) {
            const vm = this
            const url = `/stats/user/${userIds.join(',')}`

            const results = (await axios.get(url)).data

            results.points = results.points.map(({ contribution, points_total: userPoints, ID_User: userId }) => {
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
                    userId: parseInt(userId),
                    contribution,
                    userPoints,
                    levelReached,
                    pointsDiffNextLevel: pointsDiffNextLevel || null,
                    levelProgressPercentage: levelProgressPercentage || null
                }
            })

            return results
        }
    }
}