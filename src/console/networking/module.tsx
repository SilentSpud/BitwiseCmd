import React from "react";
import AppState from "../../app/AppState";
import { CmdShell, type CommandInput, type CommandOptions } from "../../app/cmd";
import ErrorResultView from "../../app/components/ErrorResultView";
import IpAddressView from "./components/IpAddressView";
import ipAddressParser, { ParsingError, type ParsedIpObject } from "./ip-parser";
import { IpAddress, IpAddressWithSubnetMask, SubnetCommand, VpcCommand } from "./models";
import log from "loglevel";
import SubnetView from "./components/SubnetView";
import { createSubnetMaskIp } from "./subnet-utils";
import { sendAnalyticsEvent } from "../../app/analytics";
import TextResultView from "../../app/components/TextResultView";
import VpcView from "./components/VpcView";

const networkingAppModule = {
  setup: function (appState: AppState, cmd: CmdShell) {
    // Add Ip Address commands
    cmd.command({
      canHandle: (input: string) => ipAddressParser.parse(input) != null,
      handle: function (c: CommandInput) {
        var result = ipAddressParser.parse(c.input);

        if (result == null) return;

        if (result instanceof ParsingError) {
          appState.addCommandResult(c.input, () => <ErrorResultView errorMessage={(result as ParsingError).errorMessage} />);
          return;
        }

        if (result instanceof SubnetCommand) {
          appState.addCommandResult(c.input, () => <SubnetView subnet={result as SubnetCommand} />);
          trackCommand("SubnetCommand", c.options);
          return;
        }

        if (result instanceof VpcCommand) {
          appState.addCommandResult(c.input, () => <VpcView vpc={result as VpcCommand} />);
          trackCommand("VpcCommand", c.options);
          return;
        }

        const ipAddresses: IpAddress[] = [];

        (result as ParsedIpObject[]).forEach((r) => {
          if (r instanceof IpAddressWithSubnetMask) {
            ipAddresses.push(r.ipAddress);
            ipAddresses.push(createSubnetMaskIp(r));
          } else if (r instanceof IpAddress) {
            ipAddresses.push(r);
          }
        });

        trackCommand("IpAddressesInput", c.options);

        appState.addCommandResult(c.input, () => <IpAddressView ipAddresses={ipAddresses} />);
      },
    });

    log.debug();
  },
};

function trackCommand(action: string, ops: CommandOptions) {
  if (ops.doNotTrack !== true) {
    sendAnalyticsEvent({
      eventCategory: "NetworkingCommand",
      eventAction: action,
    });
  }
}

export default networkingAppModule;
