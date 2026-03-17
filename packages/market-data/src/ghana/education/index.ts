import type { ProjectPhase, EducationModule } from "../../types";
import { GHANA_EDUCATION_DEFINE } from "./define";
import { GHANA_EDUCATION_FINANCE } from "./finance";
import { GHANA_EDUCATION_LAND } from "./land";
import { GHANA_EDUCATION_DESIGN } from "./design";
import { GHANA_EDUCATION_APPROVE } from "./approve";
import { GHANA_EDUCATION_ASSEMBLE } from "./assemble";
import { GHANA_EDUCATION_BUILD } from "./build";
import { GHANA_EDUCATION_VERIFY } from "./verify";
import { GHANA_EDUCATION_OPERATE } from "./operate";

export const GHANA_EDUCATION: Record<ProjectPhase, EducationModule> = {
  DEFINE: GHANA_EDUCATION_DEFINE,
  FINANCE: GHANA_EDUCATION_FINANCE,
  LAND: GHANA_EDUCATION_LAND,
  DESIGN: GHANA_EDUCATION_DESIGN,
  APPROVE: GHANA_EDUCATION_APPROVE,
  ASSEMBLE: GHANA_EDUCATION_ASSEMBLE,
  BUILD: GHANA_EDUCATION_BUILD,
  VERIFY: GHANA_EDUCATION_VERIFY,
  OPERATE: GHANA_EDUCATION_OPERATE,
};
