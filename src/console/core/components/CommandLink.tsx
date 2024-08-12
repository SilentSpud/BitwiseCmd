import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import cmd from "../../../app/cmd";

type CommandLinkProps = {
  command?: string;
  text: string;
  textClassName?: string;
  icon?: IconDefinition;
};

function CommandLink({ icon, command, text, textClassName }: CommandLinkProps) {
  const onClick = () => cmd.execute(command || text);

  if (icon != null)
    return (
      <a onClick={onClick}>
        <FontAwesomeIcon icon={icon} className="icon" />
        <span className={textClassName}>{text}</span>
      </a>
    );

  return (
    <a onClick={onClick}>
      <span className={textClassName}>{text}</span>
    </a>
  );
}

export default CommandLink;
