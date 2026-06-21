import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need `getLedgerMonthStats` to return `simulatedAttendances`
# Around line 254: return { milestones: monthMilestones, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances };
old_get_ledger_return = """                    if (monthMilestones.length > 0) {
                        return { milestones: monthMilestones, hasAnyAttendance: result.hasAnyAttendance };
                    }
                }
                // fallback to old redDays logic
                if (result && result.redDays && result.redDays.length > 0) {
                    return { eighthDays: result.redDays, eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance };
                }
            }
        }
    return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false, milestones: [] };"""

new_get_ledger_return = """                    if (monthMilestones.length > 0) {
                        return { milestones: monthMilestones, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances };
                    }
                }
                // fallback to old redDays logic
                if (result && result.redDays && result.redDays.length > 0) {
                    return { eighthDays: result.redDays, eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances };
                }
                
                // If there are simulated attendances but no milestone yet (or milestone is in a future month), we still want to return them!
                if (result && result.simulatedAttendances && result.simulatedAttendances.length > 0) {
                     return { eighthDays: [], eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances, milestones: [] };
                }
            }
        }
    return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false, milestones: [], simulatedAttendances: [] };"""

if old_get_ledger_return in content:
    content = content.replace(old_get_ledger_return, new_get_ledger_return)
    print("Replaced get_ledger_return successfully.")
else:
    print("Could not find get_ledger_return.")

# Then in getAllLedgerMonthStats:
# We need to collect simulatedAttendances and push them! Wait, `getAllLedgerMonthStats` returns an array of milestones.
# Let's see what `getAllLedgerMonthStats` does. It maps `getLedgerMonthStats` into a flat list of `eighthDay` and `fee` etc.

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

