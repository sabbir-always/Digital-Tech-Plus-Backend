import CategoriesModel from "#/models/categories.model.js";
import PortfolioModel from "#/models/portfolio.model.js";
import ServiceModel from "#/models/services.model.js";
import TeamsModel from "#/models/teams.model.js";

export const show = async (req, res) => {
    try {
        const [totalCategories, totalServices, activeServices, inactiveServices, totalPortfolio, activePortfolio, inactivePortfolio, totalTeamMembers, activeTeamMembers, inactiveTeamMembers] = await Promise.all([
            CategoriesModel.countDocuments(),
            ServiceModel.countDocuments(),
            ServiceModel.countDocuments({ status: "active" }),
            ServiceModel.countDocuments({ status: "inactive" }),
            PortfolioModel.countDocuments(),
            PortfolioModel.countDocuments({ status: "active" }),
            PortfolioModel.countDocuments({ status: "inactive" }),
            TeamsModel.countDocuments(),
            TeamsModel.countDocuments({ status: "active" }),
            TeamsModel.countDocuments({ status: "inactive" }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Dashboard Loaded Success",
            payload: {
                total_categories: totalCategories,
                total_services: totalServices,
                active_services: activeServices,
                inactive_services: inactiveServices,
                total_portfolio: totalPortfolio,
                active_portfolio: activePortfolio,
                inactive_portfolio: inactivePortfolio,
                total_team_members: totalTeamMembers,
                active_team_members: activeTeamMembers,
                inactive_team_members: inactiveTeamMembers
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}