import type { ProjectPhase, EducationModule } from "../../types";
import { BENIN_EDUCATION_DEFINE } from "./define";
import { BENIN_EDUCATION_FINANCE } from "./finance";
import { BENIN_EDUCATION_LAND } from "./land";
import { BENIN_EDUCATION_DESIGN } from "./design";
import { BENIN_EDUCATION_APPROVE } from "./approve";
import { BENIN_EDUCATION_ASSEMBLE } from "./assemble";
import { BENIN_EDUCATION_BUILD } from "./build";
import { BENIN_EDUCATION_VERIFY } from "./verify";
import { BENIN_EDUCATION_OPERATE } from "./operate";

export const BENIN_EDUCATION: Record<ProjectPhase, EducationModule> = {
  DEFINE: BENIN_EDUCATION_DEFINE,
  FINANCE: BENIN_EDUCATION_FINANCE,
  LAND: BENIN_EDUCATION_LAND,
  DESIGN: BENIN_EDUCATION_DESIGN,
  APPROVE: BENIN_EDUCATION_APPROVE,
  ASSEMBLE: BENIN_EDUCATION_ASSEMBLE,
  BUILD: BENIN_EDUCATION_BUILD,
  VERIFY: BENIN_EDUCATION_VERIFY,
  OPERATE: BENIN_EDUCATION_OPERATE,
};
