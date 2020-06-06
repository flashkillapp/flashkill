
import { insertDataTablesCss } from "../../util/content/util";
import { insertMatchResults } from "./content";

const teamIdRegex = /leagues\/teams\/([0-9]+)-/;
const teamId = Number(window.location.href.match(teamIdRegex)[1]);

insertDataTablesCss();

insertMatchResults(teamId);
