import React from "react";
import cx from "classnames";

export interface Props {
  className?: string;
  isSaved?: boolean;
}

const SaveIcon = ({ className, isSaved = false }: Props) => {
  return !isSaved ? (
    <svg
      className={cx("icon", "icon-heart", className)}
      data-testid="empty-heart"
      aria-labelledby="title"
      aria-describedby="desc"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 17 20"
    >
      <title>Heart</title>
      <desc>Add color to favorites</desc>
      <path d="M12.0281005,0 C10.7481005,0 9.46910054,0.488 8.49310054,1.464 C7.51610054,0.488 6.23710054,0 4.95710054,0 C3.52710054,0 2.09810054,0.609 1.09110054,1.828 C-0.571899461,3.842 -0.272899461,6.841 1.57310054,8.688 L7.78510054,14.899 C7.98110054,15.095 8.23710054,15.192 8.49310054,15.192 C8.74810054,15.192 9.00410054,15.095 9.20010054,14.899 L15.4121005,8.688 C17.2581005,6.841 17.5571005,3.842 15.8941005,1.828 C14.8881005,0.609 13.4581005,0 12.0281005,0 M12.0281005,2 C12.9271005,2 13.7741005,2.402 14.3521005,3.102 C15.3201005,4.274 15.1641005,6.106 13.9981005,7.273 L8.49310054,12.778 L2.98810054,7.273 C1.82110054,6.106 1.66510054,4.274 2.63310054,3.102 C3.21110054,2.402 4.05810054,2 4.95710054,2 C5.75810054,2 6.51210054,2.312 7.07810054,2.879 L8.49310054,4.293 L9.90710054,2.879 C10.4731005,2.312 11.2271005,2 12.0281005,2" />
    </svg>
  ) : (
    <svg
      className={cx("icon", "icon-heart", className)}
      data-testid="full-heart"
      aria-labelledby="title"
      aria-describedby="desc"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 125"
    >
      <title>Heart</title>
      <desc>Remove color from favorites</desc>
      <path d="M50,94,9.3,53.3A27.71,27.71,0,0,1,48.49,14.11L50,15.63l1.51-1.52A27.71,27.71,0,0,1,90.7,53.3Z" />
    </svg>
  );
};

export default SaveIcon;
