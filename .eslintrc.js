// eslint-disable-next-line no-undef
module.exports = {
  extends: "@longwoo/typescript-prettier",
  rules: {
		"@typescript-eslint/ban-ts-comment": ['error', {
			"ts-ignore": false
		}]
  },
};
