.versions |
map(
    select(
        (
          . | match("^(\\d+)\\.(\\d+)") |
            (
              # versions >= 3.8 < 4.0
              ((.captures[0].string | tonumber == 3) and (.captures[1].string | tonumber >= 8))
              or
              # versions >= 4.0
              (.captures[0].string | tonumber >= 4)
            )
        )
        and
        # skip 3.8 alphas (error codes were only introduced in beta)
        (. | contains("3.8.0-alpha") | not)
        and
        # skip accidental 3.13.9-rc.0
        (. | contains("3.13.9-rc.0") | not)
        and
        # skip some weird versions on npm
        (. | test("^\\d\\.\\d+\\.\\d+(-(alpha|beta|rc)\\.\\d+)?$"))
    )
    | { key: ("@apollo-client/"+.), value: ("npm:@apollo/client@"+.) }
)
| from_entries
| . as $dependencies
| . = $package[0]
| .["dependencies"] = $dependencies
| .
