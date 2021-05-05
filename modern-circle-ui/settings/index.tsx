const colors = [
    "#ffffff",
    "#ec3ba6",
    "#ea5151",
    "#ec9236",
    "#cb9d64",
    "#c0ec36",
    "#54e695",
    "#09cddb",
    "#5aafd0",
    "#698cc4",
    "#a166cc",
].map(color => ({ color }));

registerSettingsPage(({ settings }) => (
    <Page>
        {/* Basic settings */}
        <Section
            title={
                <Text bold align="center">
                    Basic Settings
        </Text>
            }
        >
            <Select
                label={`24h / 12h`}
                settingsKey="time"
                options={[
                    { name: "24h" },
                    { name: "12h" },
                ]}
            />
            <Select
                label={`Altimeter unit`}
                settingsKey="altimeterUnit"
                options={[
                    { name: "m" },
                    { name: "ft" },
                ]}
            />
        </Section>

        {/* Color settings */}
        < Section
            title={
                < Text bold align="center" >
                    Clock Colors
        </Text >
            }
        >
            <Text>Hours Hand of clock face</Text>
            <ColorSelect
                colors={colors}
                settingsKey="hoursHand"
            />
            <Text>Minutes Hand of clock face</Text>
            <ColorSelect
                colors={colors}
                settingsKey="munutesHand"
            />
            <Text>Seconds Hand of clock face</Text>
            <ColorSelect
                colors={colors}
                settingsKey="secondsHand"
            />
        </Section >

        <Section
            title={
                <Text bold align="center">
                    Stats Colors
        </Text>
            }
        >
            <Text>Steps color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="stepsColor"
            />
            <Text>Calories color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="calColor"
            />

            <Text>Distance color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="distColor"
            />

            <Text>Elevation color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="elevationColor"
            />
        </Section>

        <Section
            title={
                <Text bold align="center">
                    Stat Circles Settings
        </Text>
            }
        >
            <Text>Battery Circle Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="batteryCircleColor"
            />

            <Text>Battery Text Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="batteryTextColor"
            />

            <Text>hPa Barometetr Circle Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="hPaCircleColor"
            />

            <Text>hPa Barometetr Text Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="hPaTextColor"
            />

            <Text>Height Circle Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="heightArcColor"
            />

            <Text>Height Text Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="heightTextColor"
            />
        </Section>

        <Section
            title={
                <Text bold align="center">
                    Heart ECG Settings
        </Text>
            }
        >
            <Text>Heart Icon Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="heartIconColor"
            />

            <Text>Warning Wave Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="warningWaveColor"
            />

            <Text>Danger Wave Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="dangerWaveColor"
            />

            <Text>Normal Wave Color</Text>
            <ColorSelect
                colors={colors}
                settingsKey="normalWaveColor"
            />

        </Section>
    </Page >
));
