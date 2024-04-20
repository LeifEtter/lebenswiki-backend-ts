import * as shell from "shelljs";

/** Called by the build script to copy all views to the build folder */
shell.cp("-R", "src/views", "build/");
