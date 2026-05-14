export interface TreeNode {
  name: string
  branchLength: number
  children: TreeNode[]
}

export function parseNewick(s: string): TreeNode {
  const str = s.trim().replace(/;$/, '').trim()
  const ctx = { s: str, pos: 0 }
  return parseSubtree(ctx)
}

function parseSubtree(ctx: { s: string; pos: number }): TreeNode {
  if (ctx.s[ctx.pos] === '(') {
    ctx.pos++
    const children: TreeNode[] = [parseSubtree(ctx)]
    while (ctx.pos < ctx.s.length && ctx.s[ctx.pos] === ',') {
      ctx.pos++
      children.push(parseSubtree(ctx))
    }
    if (ctx.pos < ctx.s.length && ctx.s[ctx.pos] === ')') ctx.pos++
    const name = parseName(ctx)
    const branchLength = parseBranchLength(ctx)
    return { name, branchLength, children }
  } else {
    const name = parseName(ctx)
    const branchLength = parseBranchLength(ctx)
    return { name, branchLength, children: [] }
  }
}

function parseName(ctx: { s: string; pos: number }): string {
  let name = ''
  while (ctx.pos < ctx.s.length && !'(),;:'.includes(ctx.s[ctx.pos])) name += ctx.s[ctx.pos++]
  return name.trim()
}

function parseBranchLength(ctx: { s: string; pos: number }): number {
  if (ctx.pos >= ctx.s.length || ctx.s[ctx.pos] !== ':') return 0
  ctx.pos++
  let n = ''
  const valid = new Set(['.', '-', '+', 'e', 'E', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
  while (ctx.pos < ctx.s.length && valid.has(ctx.s[ctx.pos])) n += ctx.s[ctx.pos++]
  return parseFloat(n) || 0
}
