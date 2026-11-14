import { IsIn, IsInt, Matches, Max, Min } from 'class-validator';

export const NODE_ENVS = ['development', 'test', 'production'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export class Env {
  @IsIn(NODE_ENVS)
  NODE_ENV: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @Matches(/^postgres(ql)?:\/\/.+/)
  DATABASE_URL: string;
}
