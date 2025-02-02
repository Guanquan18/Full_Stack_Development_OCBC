const Rewards = require('../models/rewards');

const getRewardsByProfileId = async (req, res) => {
    const profileId = req.body.profileId; // Extract the account number from the request body
    try {
        const rewards = await Rewards.getRewardsByProfileId(profileId); // Attempt to fetch rewards by AccNum\

        if (!rewards) {
            return res.status(404).send("Rewards not found"); // Handle case where no rewards are found
        }

        res.json(rewards);  // Return rewards details as JSON response

    } catch (error) {
        console.error("Error retrieving rewards", error.message);
        res.status(500).send("Error retrieving rewards");  
    }
}

const claimRewards = async (req, res) => {
    const rewardDescription = req.body.rewardDescription;
    const rewardType = req.body.rewardType;
    const rewardAmount = req.body.rewardAmount;
    const accNum = req.body.accNum;


    try {
        const rewards = await Rewards.claimRewards(rewardDescription, rewardType, rewardAmount, accNum);

        if (!rewards) {
            return res.status(404).send("Rewards not found");
        }

        res.json(rewards);

    } catch (error) {
        console.error("Error claiming rewards: ", error.message);
        res.status(500).send("Error claiming rewards");
    }
}

module.exports = {
    getRewardsByProfileId,
    claimRewards
};