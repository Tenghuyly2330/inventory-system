import * as authService from "../services/authService.js";

export const login = async (req, res, next) => {
      try {
            const { email, password } = req.body;
            const result = await authService.loginUser(email, password);

            res.status(200).json({
                  success: true,
                  message: "Login successful",
                  user: result.user,
                  token: result.token
            });
      } catch (error) {
            next(error);
      }
};

export const getMe = async (req, res, next) => {
      try {
            const user = await authService.getCurrentUser(req.user.id);

            res.status(200).json({
                  success: true,
                  data: user
            });
      } catch (error) {
            next(error);
      }
};
